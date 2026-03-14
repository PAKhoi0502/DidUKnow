export const queryKeys = {
  facts: (params) => ['facts', params],
  factDetail: (factId, language) => ['fact', factId, language],
  randomFact: (params) => ['facts-random', params],
  categories: (language) => ['categories', language],
  tags: () => ['tags'],
  comments: (factId, params) => ['comments', factId, params],
  favouritesCheck: (factId) => ['favourites-check', factId],
  collections: (params) => ['collections', params],
  collectionFacts: (collectionId, params) => ['collection-facts', collectionId, params]
}
