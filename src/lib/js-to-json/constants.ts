export const JS_TO_JSON_DEBOUNCE_MS = 300;

export const DEFAULT_JS_OBJECT_EXAMPLE = `{
  name: 'John Doe',
  age: 30,
  isActive: true,
  // This is a comment
  address: {
    street: '123 Main St',
    city: 'New York',
    zip: undefined, // will be removed
  },
  hobbies: ['reading', 'coding', 'gaming',],
  greet: function() { return 'hello'; }, // will be removed
  score: Infinity,
  metadata: {
    createdAt: new Date('2024-01-15'),
    tags: ['user', 'admin',],
  },
}`;
