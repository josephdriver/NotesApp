// Purpose: Generate a random id for a new item.
// Usage: idGenerator()
// Return: A random id.
// Note: This is a helper function.
export const idGenerator = () => {
	return Math.random().toString(36).substr(2, 9);
};
