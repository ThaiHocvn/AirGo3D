import { useMutation } from "@apollo/client";
import { TOGGLE_BOOKMARK, GET_PANORAMAS } from "../queries";

export function useToggleBookmark() {
  const [toggleBookmark, { loading, error }] = useMutation(TOGGLE_BOOKMARK);

  const toggle = async (id: string) => {
    return toggleBookmark({
      variables: { id },
      optimisticResponse: {
        toggleBookmark: {
          id,
          isBookmarked: true,
          __typename: "Panorama",
        },
      },
      refetchQueries: [GET_PANORAMAS],
    });
  };

  return { toggle, loading, error };
}
