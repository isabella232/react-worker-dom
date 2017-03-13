import { OPS as _, WORKER_MESSAGES } from '../common/constants';
import { serializeEvent } from '../common/channel';


//-----------------------------------------------------------------------------
// DOM Operations
//-----------------------------------------------------------------------------

function buildDomOperations(body, channel, container, head, nodes) {
  const DomOperations = {
    [_.attachRoot](none, id, node) {
      nodes[id] = container;
    },
    [_.attachHead](none, id, node) {
      nodes[id] = head;
    },
    [_.attachBody](none, id, node) {
      nodes[id] = body;
    },

    // Creating new nodes
    [_.createDOMElement](id, type) {
      nodes[id] = document.createElement(type);
      nodes[id]['__reactNode'] = id;
    },
    [_.createComment](id, val) {
      nodes[id] = document.createComment(val);
      nodes[id]['__reactNode'] = id;
    },
    [_.createFragment](id) {
      nodes[id] = document.createDocumentFragment();
      nodes[id]['__reactNode'] = id;
    },
    [_.createTextNode](id, val) {
      nodes[id] = document.createTextNode(val);
      nodes[id]['__reactNode'] = id;
    },

    // Operations on nodes
    [_.setAttribute](id, key, val) {
      setAttribute(nodes[id], key, val);
    },
    [_.setTextContent](id, val) {
      nodes[id].textContent = val;
    },
    [_.setStyle](id, key, val) {
      nodes[id].style[key] = val;
    },
    [_.innerHTML](id, val) {
      nodes[id].innerHTML = val;
    },

    // DOM tree manipulation ops
    [_.appendChild](id, node) {
      nodes[id].appendChild(node);
    },
    [_.removeChild](id, node) {
      nodes[id].removeChild(node);
    },
    [_.insertBefore](id, newNode, refNode) {
      nodes[id].insertBefore(newNode, refNode);
    },
    [_.replaceChild](id, newNode, node) {
      nodes[id].replaceChild(newNode, node);
    },

    // Remove node
    [_.removeAttribute](id, key) {
      nodes[id].removeAttribute(key);
    },

    // Events
    [_.addEventHandler](id, type, handler, useCapture) {
      const node = typeof id === 'string' ? window[id] : nodes[id];
      node.addEventListener(type, (e) => {
        channel.send(WORKER_MESSAGES.event, { handler, event: serializeEvent(e) });
        if (type === 'submit'){
          e.preventDefault();
        }
      }, useCapture);
    }
  };

  return DomOperations;
}


function setAttribute(node, key, value) {
  switch (key) {
    case 'style':
      for (const prop in value) {
        node.style[prop] = value[prop];
      }
      break;
    case 'checked':
      node.checked = !!value;
      break;
    case 'className':
      node.className = value;
    default:
      node.setAttribute(key, value);

  }
}


//-----------------------------------------------------------------------------
// DOM Operation Handler
//-----------------------------------------------------------------------------

export default (head, body, container, channel) => {
  const nodes = {};
  const domOperations = buildDomOperations(document.body, channel, container, document.head, nodes);

  return ({ operation, guid, args, guidPos = [] }) => {
    guidPos.forEach(pos => args[pos] = nodes[args[pos]]);
    domOperations[operation](guid, ...args);
  };
};
