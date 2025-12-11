import gql from "graphql-tag";

export const typeDefs = gql`
  scalar Upload
  scalar Date
  scalar JSON

  type Panorama {
    id: ID!
    name: String!
    filename: String!
    originalName: String!
    path: String!
    size: Int!
    mimeType: String!
    width: Int
    height: Int
    isBookmarked: Boolean!
    previewUrl: String!
    thumbnailUrl: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type PanoramaList {
    items: [Panorama!]!
    total: Int!
  }

  type PanoramaStats {
    total: Int!
    bookmarked: Int!
    unbookmarked: Int!
  }

  type Query {
    panoramas(
      search: String
      isBookmarked: Boolean
      limit: Int
      offset: Int
    ): PanoramaList!
    panoramaStats: PanoramaStats!
  }

  type Mutation {
    uploadPanorama(file: Upload!, name: String!): Panorama!
    deletePanorama(id: ID!): Boolean!
    toggleBookmark(id: ID!): Panorama!
  }
`;
