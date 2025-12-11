import { gql } from "@apollo/client";

export const GET_PANORAMAS = gql`
  query GetPanoramas(
    $search: String
    $isBookmarked: Boolean
    $limit: Int
    $offset: Int
  ) {
    panoramas(
      search: $search
      isBookmarked: $isBookmarked
      limit: $limit
      offset: $offset
    ) {
      items {
        id
        name
        filename
        originalName
        path
        size
        mimeType
        width
        height
        isBookmarked
        previewUrl
        thumbnailUrl
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const GET_PANORAMA_STATS = gql`
  query GetPanoramaStats {
    panoramaStats {
      total
      bookmarked
      unbookmarked
    }
  }
`;

export const UPLOAD_PANORAMA = gql`
  mutation UploadPanorama($file: Upload!, $name: String!) {
    uploadPanorama(file: $file, name: $name) {
      id
      name
      filename
      originalName
      path
      size
      mimeType
      isBookmarked
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PANORAMA = gql`
  mutation DeletePanorama($id: ID!) {
    deletePanorama(id: $id)
  }
`;

export const TOGGLE_BOOKMARK = gql`
  mutation ToggleBookmark($id: ID!) {
    toggleBookmark(id: $id) {
      id
      isBookmarked
      updatedAt
    }
  }
`;
