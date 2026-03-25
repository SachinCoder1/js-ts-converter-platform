export const MAX_CODE_SIZE = 50 * 1024; // 50KB
export const DEBOUNCE_MS = 500;
export const AI_TIMEOUT_MS = 30_000; // 30 seconds
export const CONVERT_COOLDOWN_MS = 2_000; // 2 seconds

export const RATE_LIMITS = {
  perMinute: 10,
  perHour: 50,
  perDay: 200,
  concurrent: 2,
} as const;

export const FAILURE_LIMITS = {
  maxFailures: 5,
  windowMs: 60_000, // 1 minute
  blockDurationMs: 5 * 60_000, // 5 minutes
} as const;

export const GLOBAL_RATE_LIMIT = {
  maxRequestsPerMinute: 500,
} as const;

export const MAX_CACHE_SIZE = 500;
export const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

export const SITE_URL = 'https://devshift.dev';
export const SITE_NAME = 'DevShift';

export const DEFAULT_EXAMPLE_CODE = `import React, { useState, useEffect } from 'react';

// A sample user dashboard component
function UserDashboard(props) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('Delete this user?');
    if (!confirmed) return;

    await fetch(\`/api/users/\${userId}\`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  if (loading) return <div className="spinner">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h1>{props.title || 'User Dashboard'}</h1>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <p>Showing {filteredUsers.length} of {users.length} users</p>
      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>
            <span>{user.name} ({user.email})</span>
            <button onClick={() => handleDeleteUser(user.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserDashboard;
`;

export const DEFAULT_JSON_EXAMPLE = `{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "name": "my-app",
    "namespace": "production",
    "labels": {
      "app": "my-app",
      "version": "1.0.0"
    }
  },
  "spec": {
    "replicas": 3,
    "selector": {
      "matchLabels": {
        "app": "my-app"
      }
    },
    "template": {
      "spec": {
        "containers": [
          {
            "name": "app",
            "image": "my-app:1.0.0",
            "ports": [{ "containerPort": 3000 }],
            "env": [
              { "name": "NODE_ENV", "value": "production" },
              { "name": "PORT", "value": "3000" }
            ]
          }
        ]
      }
    }
  }
}`;

export const DEFAULT_JSON_TO_TS_EXAMPLE = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "isVerified": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "orders": [
    {
      "orderId": "ORD-001",
      "total": 99.99,
      "items": ["Widget A", "Widget B"],
      "status": "delivered"
    }
  ],
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  },
  "metadata": null
}`;

import type { JsonToTsOptions } from './types';

export const DEFAULT_JSON_TO_TS_OPTIONS: JsonToTsOptions = {
  outputStyle: 'interface',
  exportKeyword: true,
  optionalFields: 'required',
  readonlyProperties: false,
  rootTypeName: 'Root',
};

export const DEFAULT_CSS_EXAMPLE = `.card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.card-body {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
}

@media (min-width: 768px) {
  .card {
    padding: 32px;
  }
}`;

export const DEFAULT_SCSS_EXAMPLE = `$primary: #3b82f6;
$radius: 8px;
$spacing: (sm: 8px, md: 16px, lg: 24px);

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  background: white;
  border-radius: $radius;
  padding: map-get($spacing, md);

  &__header {
    @include flex-center;
    border-bottom: 1px solid lighten($primary, 30%);

    h2 {
      color: $primary;
      font-size: 1.5rem;
    }
  }

  &__body {
    padding: map-get($spacing, sm);

    p {
      line-height: 1.6;
      color: #666;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &:hover {
    box-shadow: 0 4px 12px rgba($primary, 0.15);
  }
}
`;

export const DEFAULT_HTML_EXAMPLE = `<div class="container">
  <h1 class="title" style="color: red; font-size: 24px;">Hello World</h1>
  <img src="/logo.png" alt="Logo" class="logo">
  <label for="email">Email</label>
  <input type="email" id="email" class="input" tabindex="1" autofocus>
  <br>
  <button class="btn" onclick="handleClick()" disabled>Submit</button>
  <!-- TODO: Add footer -->
  <svg viewBox="0 0 24 24" stroke-width="2" fill-rule="evenodd">
    <path d="M12 2L2 22h20L12 2z"/>
  </svg>
</div>`;

export const DEFAULT_YAML_EXAMPLE = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: production
  labels:
    app: my-app
    version: "1.0.0"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
        - name: app
          image: my-app:1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: PORT
              value: "3000"
          resources:
            limits:
              memory: "256Mi"
              cpu: "500m"`;

export const DEFAULT_PROPTYPES_EXAMPLE = `import React from 'react';
import PropTypes from 'prop-types';

function UserCard({ name, email, age, role, avatar, onEdit, onDelete, isActive, tags, address }) {
  return (
    <div className={\`user-card \${isActive ? 'active' : ''}\`}>
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      <span className="role">{role}</span>
      {age && <span className="age">Age: {age}</span>}
      <div className="tags">
        {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <p>{address.street}, {address.city}, {address.state} {address.zip}</p>
      <button onClick={() => onEdit(email)}>Edit</button>
      <button onClick={() => onDelete(email)}>Delete</button>
    </div>
  );
}

UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  age: PropTypes.number,
  role: PropTypes.oneOf(['admin', 'editor', 'viewer']).isRequired,
  avatar: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  isActive: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.string),
  address: PropTypes.shape({
    street: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    state: PropTypes.string,
    zip: PropTypes.string.isRequired,
  }).isRequired,
};

UserCard.defaultProps = {
  age: undefined,
  avatar: '/default-avatar.png',
  onDelete: () => {},
  isActive: false,
  tags: [],
  address: {
    state: '',
  },
};

export default UserCard;
`;

export const DEFAULT_GRAPHQL_EXAMPLE = `scalar DateTime

enum UserRole {
  ADMIN
  USER
  MODERATOR
}

type Address {
  street: String!
  city: String!
  state: String
  zipCode: String!
  country: String!
}

type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  address: Address
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  tags: [String!]
  published: Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
  role: UserRole
  address: AddressInput
}

input AddressInput {
  street: String!
  city: String!
  state: String
  zipCode: String!
  country: String!
}

type Query {
  user(id: ID!): User
  users(role: UserRole, limit: Int): [User!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}`;

export const DEFAULT_SQL_EXAMPLE = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  age INT,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INT NOT NULL DEFAULT 0,
  author_id INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  body TEXT NOT NULL,
  post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id INT NOT NULL REFERENCES users(id),
  parent_id INT REFERENCES comments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

export const DEFAULT_OPENAPI_EXAMPLE = `{
  "openapi": "3.0.3",
  "info": {
    "title": "User API",
    "version": "1.0.0",
    "description": "A sample User management API"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "List all users",
        "operationId": "listUsers",
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "schema": { "type": "integer", "default": 20 }
          },
          {
            "name": "role",
            "in": "query",
            "schema": { "$ref": "#/components/schemas/UserRole" }
          }
        ],
        "responses": {
          "200": {
            "description": "A list of users",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/User" }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Create a user",
        "operationId": "createUser",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateUserRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created user",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/User" }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "UserRole": {
        "type": "string",
        "enum": ["admin", "editor", "viewer"]
      },
      "Address": {
        "type": "object",
        "required": ["street", "city"],
        "properties": {
          "street": { "type": "string" },
          "city": { "type": "string" },
          "state": { "type": "string" },
          "zipCode": { "type": "string" }
        }
      },
      "User": {
        "type": "object",
        "required": ["id", "name", "email", "role"],
        "properties": {
          "id": { "type": "integer", "format": "int64", "description": "Unique user identifier" },
          "name": { "type": "string", "description": "Full name of the user" },
          "email": { "type": "string", "format": "email" },
          "role": { "$ref": "#/components/schemas/UserRole" },
          "address": { "$ref": "#/components/schemas/Address" },
          "tags": {
            "type": "array",
            "items": { "type": "string" }
          },
          "metadata": {
            "type": "object",
            "additionalProperties": { "type": "string" },
            "nullable": true
          },
          "createdAt": { "type": "string", "format": "date-time" }
        }
      },
      "CreateUserRequest": {
        "type": "object",
        "required": ["name", "email", "role"],
        "properties": {
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "role": { "$ref": "#/components/schemas/UserRole" },
          "address": { "$ref": "#/components/schemas/Address" },
          "tags": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    }
  }
}`;

import type { OpenApiToTsOptions } from './types';

export const DEFAULT_OPENAPI_OPTIONS: OpenApiToTsOptions = {
  specVersion: 'auto',
  inputFormat: 'json',
  outputMode: 'interfaces-only',
  enumStyle: 'union',
  addJsDoc: true,
};

export const TOOL_REGISTRY = {
  'js-to-ts': {
    id: 'js-to-ts' as const,
    name: 'JS to TypeScript',
    shortName: 'JS \u2192 TS',
    path: '/js-to-ts',
    description: 'Convert JavaScript/JSX to TypeScript/TSX',
  },
  'json-to-ts': {
    id: 'json-to-ts' as const,
    name: 'JSON to TypeScript',
    shortName: 'JSON \u2192 TS',
    path: '/json-to-typescript',
    description: 'Generate TypeScript interfaces from JSON',
  },
  'json-to-zod': {
    id: 'json-to-zod' as const,
    name: 'JSON to Zod',
    shortName: 'JSON \u2192 Zod',
    path: '/json-to-zod',
    description: 'Generate Zod validation schemas from JSON',
  },
  'json-to-yaml': {
    id: 'json-to-yaml' as const,
    name: 'JSON to YAML',
    shortName: 'JSON \u2192 YAML',
    path: '/json-to-yaml',
    description: 'Convert JSON to YAML format',
  },
  'yaml-to-json': {
    id: 'yaml-to-json' as const,
    name: 'YAML to JSON',
    shortName: 'YAML \u2192 JSON',
    path: '/yaml-to-json',
    description: 'Convert YAML to JSON format',
  },
  'css-to-json': {
    id: 'css-to-json' as const,
    name: 'CSS to JSON',
    shortName: 'CSS \u2192 JSON',
    path: '/css-to-json',
    description: 'Convert CSS rules to JSON objects (CSS-in-JS)',
  },
  'js-object-to-json': {
    id: 'js-object-to-json' as const,
    name: 'JS Object to JSON',
    shortName: 'JS Obj \u2192 JSON',
    path: '/js-object-to-json',
    description: 'Convert JS object literals to valid JSON',
  },
  'css-to-tailwind': {
    id: 'css-to-tailwind' as const,
    name: 'CSS to Tailwind',
    shortName: 'CSS \u2192 TW',
    path: '/css-to-tailwind',
    description: 'Convert CSS to Tailwind utility classes',
  },
  'scss-to-css': {
    id: 'scss-to-css' as const,
    name: 'SCSS to CSS',
    shortName: 'SCSS \u2192 CSS',
    path: '/scss-to-css',
    description: 'Compile SCSS/SASS to standard CSS',
  },
  'html-to-jsx': {
    id: 'html-to-jsx' as const,
    name: 'HTML to JSX',
    shortName: 'HTML \u2192 JSX',
    path: '/html-to-jsx',
    description: 'Convert HTML to valid JSX/TSX for React',
  },
  'tailwind-to-css': {
    id: 'tailwind-to-css' as const,
    name: 'Tailwind to CSS',
    shortName: 'TW \u2192 CSS',
    path: '/tailwind-to-css',
    description: 'Reverse Tailwind utilities to vanilla CSS',
  },
  'graphql-to-ts': {
    id: 'graphql-to-ts' as const,
    name: 'GraphQL to TypeScript',
    shortName: 'GQL \u2192 TS',
    path: '/graphql-to-typescript',
    description: 'Generate TypeScript types from GraphQL schemas',
  },
  'proptypes-to-ts': {
    id: 'proptypes-to-ts' as const,
    name: 'PropTypes to TypeScript',
    shortName: 'PT \u2192 TS',
    path: '/proptypes-to-typescript',
    description: 'Convert React PropTypes to TypeScript interfaces',
  },
  'sql-to-ts': {
    id: 'sql-to-ts' as const,
    name: 'SQL to TypeScript',
    shortName: 'SQL \u2192 TS',
    path: '/sql-to-typescript',
    description: 'Generate TypeScript types from SQL schemas',
  },
  'openapi-to-ts': {
    id: 'openapi-to-ts' as const,
    name: 'OpenAPI to TypeScript',
    shortName: 'API → TS',
    path: '/openapi-to-typescript',
    description: 'Generate TypeScript types from OpenAPI/Swagger specs',
  },
} as const;

import type { ToolMeta, FilterCategory } from './types';

export const FILTER_CATEGORIES: { id: FilterCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'json', label: 'JSON' },
  { id: 'css', label: 'CSS' },
  { id: 'react', label: 'React' },
  { id: 'schema', label: 'Schema' },
];

export const TOOL_META: Record<string, ToolMeta> = {
  'js-to-ts': {
    id: 'js-to-ts',
    categories: ['typescript'],
    tags: ['AI-Powered', 'Popular'],
    sourceLabel: 'JS',
    targetLabel: 'TS',
    featured: true,
  },
  'json-to-ts': {
    id: 'json-to-ts',
    categories: ['typescript', 'json'],
    tags: ['AI-Powered', 'Popular'],
    sourceLabel: 'JSON',
    targetLabel: 'TS',
  },
  'json-to-zod': {
    id: 'json-to-zod',
    categories: ['schema', 'json'],
    tags: ['AI-Powered'],
    sourceLabel: 'JSON',
    targetLabel: 'Zod',
  },
  'json-to-yaml': {
    id: 'json-to-yaml',
    categories: ['json'],
    tags: ['Instant'],
    sourceLabel: 'JSON',
    targetLabel: 'YAML',
  },
  'yaml-to-json': {
    id: 'yaml-to-json',
    categories: ['json'],
    tags: ['Instant'],
    sourceLabel: 'YAML',
    targetLabel: 'JSON',
  },
  'css-to-json': {
    id: 'css-to-json',
    categories: ['json', 'css'],
    tags: ['Instant'],
    sourceLabel: 'CSS',
    targetLabel: 'JSON',
  },
  'js-object-to-json': {
    id: 'js-object-to-json',
    categories: ['json'],
    tags: ['Instant'],
    sourceLabel: 'JS Obj',
    targetLabel: 'JSON',
  },
  'css-to-tailwind': {
    id: 'css-to-tailwind',
    categories: ['css'],
    tags: ['AI-Powered', 'Popular'],
    sourceLabel: 'CSS',
    targetLabel: 'TW',
  },
  'scss-to-css': {
    id: 'scss-to-css',
    categories: ['css'],
    tags: ['Instant'],
    sourceLabel: 'SCSS',
    targetLabel: 'CSS',
  },
  'html-to-jsx': {
    id: 'html-to-jsx',
    categories: ['react'],
    tags: ['Instant', 'Popular'],
    sourceLabel: 'HTML',
    targetLabel: 'JSX',
  },
  'tailwind-to-css': {
    id: 'tailwind-to-css',
    categories: ['css'],
    tags: ['Instant'],
    sourceLabel: 'TW',
    targetLabel: 'CSS',
  },
  'graphql-to-ts': {
    id: 'graphql-to-ts',
    categories: ['typescript', 'schema'],
    tags: ['AI-Powered'],
    sourceLabel: 'GQL',
    targetLabel: 'TS',
  },
  'proptypes-to-ts': {
    id: 'proptypes-to-ts',
    categories: ['typescript', 'react'],
    tags: ['AI-Powered'],
    sourceLabel: 'PropTypes',
    targetLabel: 'TS',
  },
  'sql-to-ts': {
    id: 'sql-to-ts',
    categories: ['typescript', 'schema'],
    tags: ['AI-Powered'],
    sourceLabel: 'SQL',
    targetLabel: 'TS',
  },
  'openapi-to-ts': {
    id: 'openapi-to-ts',
    categories: ['typescript', 'schema'],
    tags: ['AI-Powered'],
    sourceLabel: 'OpenAPI',
    targetLabel: 'TS',
  },
};
