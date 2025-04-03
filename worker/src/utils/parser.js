import { parse } from "@babel/parser";
import axios from "axios";

export async function parseCode({ filePath, projectId, token, env }) {
  const response = await axios.get(
    `https://api.github.com/repos/${projectId}/contents/${filePath}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "ParticleGraph-Worker/1.0",
      },
    }
  );
  const rawContent = atob(response.data.content);

  // Determine file type and plugins
  const hasTypeScriptSyntax =
    code.includes(": ") ||
    code.includes("<T>") ||
    code.includes("interface ") ||
    code.includes("type ") ||
    filePath.endsWith(".ts") ||
    filePath.endsWith(".tsx");
  const plugins = ["jsx", "decorators-legacy", hasTypeScriptSyntax ? "typescript" : "flow"];
  const ast = parse(code, {
    sourceType: "module",
    plugins,
    tokens: true,
    comments: true,
  });

  // Initialize particle (full structure from old code)
  const fileExt = filePath.split(".").pop();
  let particle = {
    path: filePath,
    type: fileExt === "jsx" || fileExt === "tsx" ? "component" : "file",
    purpose: `Handles ${filePath.split("/").pop().replace(/\.[^/.]+$/, "").toLowerCase()} functionality`,
    props: [],
    hooks: [],
    calls: [],
    logic: [],
    depends_on: [],
    jsx: [],
    state_machine: null,
    routes: [],
    comments: [],
    used_by: [], // Placeholder for future dependency tracking
  };

  // Extract comments
  if (ast.comments && ast.comments.length > 0) {
    ast.comments.forEach((comment) => {
      const text = comment.value.trim().replace(/^\*+\s*/gm, "").replace(/\n\s*\*\s*/g, "\n");
      if (text.toLowerCase().includes("todo") || text.toLowerCase().includes("fixme")) {
        particle.comments.push({ type: "todo", text, line: comment.loc.start.line });
      } else if (comment.type === "CommentBlock" && comment.loc.start.line <= 20) {
        particle.comments.push({ type: "doc", text, line: comment.loc.start.line });
        if (text.includes("component") || text.includes("Component")) {
          particle.purpose = text.split("\n")[0].trim();
        }
      }
    });
  }

  // Walk AST (full logic from old code)
  function walk(node) {
    if (!node) return;

    // Props (top-level functions)
    if ((node.type === "FunctionDeclaration" || node.type === "ArrowFunctionExpression") && node.loc?.start.line <= 10) {
      node.params.forEach((param) => {
        if (param.type === "ObjectPattern") {
          particle.props = param.properties.map((p) => ({
            name: p.key.name,
            default: p.value?.type === "AssignmentPattern" ? p.value.right.value ?? p.value.right.name ?? null : null,
            required: p.value?.type !== "AssignmentPattern",
          }));
        } else if (param.type === "Identifier") {
          particle.props = [{ name: param.name, default: null, required: true }];
        }
      });
    }

    // Hooks
    if (node.type === "CallExpression") {
      const callee = node.callee.name || (node.callee.property && `${node.callee.object?.name}.${node.callee.property.name}`);
      if (callee?.startsWith("use")) {
        const args = node.arguments
          .map((arg) => {
            if (arg.type === "StringLiteral" || arg.type === "NumericLiteral") return arg.value;
            if (arg.type === "Identifier") return arg.name;
            if (arg.type === "ObjectExpression") return "{...}";
            if (arg.type === "ArrayExpression") return "[...]";
            return null;
          })
          .filter(Boolean);
        particle.hooks.push({
          name: callee,
          args: args.length > 0 ? args : null,
          line: node.loc.start.line,
        });
      }

      // API calls
      if (callee === "fetch" || node.callee.object?.name === "axios" || node.callee.object?.name === "supabase") {
        const args = node.arguments.map((arg) => (arg.type === "StringLiteral" ? arg.value : null)).filter(Boolean);
        particle.calls.push({
          name: callee,
          args: args.length > 0 ? args : null,
          line: node.loc.start.line,
        });
      }
    }

    // Depends On (imports)
    if (node.type === "ImportDeclaration") {
      const source = node.source.value;
      const specifiers = node.specifiers
        .map((spec) => {
          if (spec.type === "ImportDefaultSpecifier") return spec.local.name;
          if (spec.type === "ImportSpecifier") return spec.imported.name;
          return null;
        })
        .filter(Boolean);
      particle.depends_on.push({
        source,
        specifiers: specifiers.length > 0 ? specifiers : null,
      });
    }

    for (const key in node) if (node[key] && typeof node[key] === "object") walk(node[key]);
  }

  // Enhance Walk (full logic from old code)
  function enhanceWalk(node) {
    if (!node) return;

    // Rich Props (from hooks)
    if (node.type === "VariableDeclarator" && node.init?.callee?.name?.startsWith("use")) {
      if (node.id?.type === "ObjectPattern") {
        node.id.properties.forEach((p) => {
          const existing = particle.props.find((prop) => prop.name === p.key.name);
          if (!existing) {
            particle.props.push({
              name: p.key.name,
              default: null,
              required: true,
              source: node.init.callee.name,
            });
          }
        });
      } else if (node.id?.type === "ArrayPattern") {
        node.id.elements.forEach((element, index) => {
          if (element?.name) {
            const hookName = node.init.callee.name;
            const existing = particle.props.find((prop) => prop.name === element.name);
            if (!existing) {
              particle.props.push({
                name: element.name,
                default: null,
                required: true,
                source: hookName,
                type: index === 1 ? "setter" : "state",
              });
            }
          }
        });
      }
    }

    // Routes (navigation and definitions)
    if (node.type === "CallExpression") {
      const callee = node.callee.name || (node.callee.property && `${node.callee.object?.name}.${node.callee.property.name}`);
      if (callee && ["router.push", "router.replace", "navigate", "navigateToTab"].includes(callee)) {
        const arg = node.arguments[0];
        let route = null;
        if (arg?.type === "StringLiteral") route = arg.value;
        else if (arg?.type === "TemplateLiteral" && arg.quasis.length > 0) route = arg.quasis[0].value.raw;
        if (route && !particle.routes.find((r) => r.path === route)) {
          particle.routes.push({ path: route, type: "navigation", line: node.loc.start.line });
        }
      }
    }

    if (
      node.type === "ObjectExpression" &&
      node.properties?.some((p) => p.key?.name === "path" || p.key?.name === "element")
    ) {
      const pathProp = node.properties.find((p) => p.key?.name === "path");
      const elementProp = node.properties.find((p) => p.key?.name === "element");
      const componentProp = node.properties.find((p) => p.key?.name === "component");
      if (pathProp?.value?.type === "StringLiteral") {
        const path = pathProp.value.value;
        let component = null;
        if (elementProp?.value?.type === "JSXElement") component = elementProp.value.openingElement.name.name;
        else if (componentProp?.value?.type === "Identifier") component = componentProp.value.name;
        if (!particle.routes.find((r) => r.path === path)) {
          particle.routes.push({ path, component, type: "definition", line: node.loc.start.line });
        }
      }
    }

    // JSX Elements
    if (node.type === "JSXElement") {
      const tag = node.openingElement?.name?.name;
      if (tag) {
        const attrs = {};
        node.openingElement.attributes?.forEach((attr) => {
          if (attr.type === "JSXAttribute") {
            const name = attr.name.name;
            let value = null;
            if (attr.value?.type === "StringLiteral") value = attr.value.value;
            else if (attr.value?.type === "JSXExpressionContainer") {
              if (attr.value.expression?.type === "Identifier") value = attr.value.expression.name;
              else if (attr.value.expression?.type === "ArrowFunctionExpression") value = "function";
            }
            if (name.startsWith("on")) {
              attrs.events = attrs.events || [];
              attrs.events.push(name);
            } else {
              attrs.props = attrs.props || [];
              attrs.props.push({ name, value });
            }
          }
        });
        particle.jsx.push({ tag, ...attrs, line: node.loc.start.line });
      }
    }

    // Logic (conditions)
    if (node.type === "IfStatement") {
      const test = node.test;
      let condition = "";
      if (test?.type === "Identifier") condition = test.name;
      else if (test?.type === "BinaryExpression") {
        const left = test.left?.property ? `${test.left.object?.name}.${test.left.property.name}` : test.left?.name || test.left?.value;
        const right = test.right?.property ? `${test.right.object?.name}.${test.right.property.name}` : test.right?.name || test.right?.value;
        condition = `${left || "unknown"} ${test.operator} ${right || "unknown"}`;
      }
      if (condition && !condition.includes("unknown")) {
        let action = "handles condition";
        if (node.consequent.type === "BlockStatement") {
          node.consequent.body.forEach((stmt) => {
            if (stmt.type === "ReturnStatement" && stmt.argument?.type === "JSXElement") {
              action = `renders ${stmt.argument.openingElement.name.name}`;
            } else if (
              stmt.type === "ExpressionStatement" &&
              (stmt.expression?.callee?.name === "router.push" || stmt.expression?.callee?.name === "navigate")
            ) {
              action = `navigates to ${stmt.expression.arguments[0]?.value || "route"}`;
            }
          });
        }
        particle.logic.push({ condition, action, line: node.loc.start.line });
      }
    }

    // State Machines
    if (node.type === "VariableDeclarator" && (node.id.name?.endsWith("_STATES") || node.id.name?.endsWith("States"))) {
      let states = [];
      if (node.init?.type === "ObjectExpression") {
        states = node.init.properties?.map((prop) => ({
          name: prop.key.name || prop.key.value,
          value: prop.value?.value,
        })) || [];
      }
      if (states.length > 0) {
        particle.state_machine = { name: node.id.name, states, line: node.loc.start.line };
      }
    } else if (node.type === "CallExpression" && (node.callee?.name === "useReducer" || node.callee?.name === "createReducer")) {
      const reducerArg = node.arguments[0];
      if (reducerArg?.type === "Identifier") {
        particle.state_machine = { name: `${reducerArg.name} (reducer)`, type: "reducer", line: node.loc.start.line };
      }
    }

    for (const key in node) if (node[key] && typeof node[key] === "object") enhanceWalk(node[key]);
  }

  walk(ast);
  enhanceWalk(ast);

  // Filter empty fields (as in old code)
  Object.keys(particle).forEach((key) => {
    if (Array.isArray(particle[key]) && particle[key].length === 0) delete particle[key];
    if (key === "state_machine" && (!particle[key] || (particle[key].states && particle[key].states.length === 0))) delete particle[key];
  });
  particle.content = content; 
  return { ast, particle };
}