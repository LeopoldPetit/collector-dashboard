/**
 * Mock du pool PostgreSQL pour les tests unitaires.
 * Chaque test peut surcharger `mockQuery` pour simuler les résultats de BD.
 */
export const mockQuery = jest.fn();

export const pool = {
  query: mockQuery,
};
