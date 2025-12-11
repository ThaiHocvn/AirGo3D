import { useMutation } from "@apollo/client";
import { DELETE_PANORAMA } from "../queries";
import { removePanorama } from "../../store/slices/panoramaSlice";
import { useDispatch } from "react-redux";

export function useDeletePanorama() {
  const dispatch = useDispatch();

  const [deletePanoramaMutation, { loading, error }] =
    useMutation(DELETE_PANORAMA);

  const deletePanorama = async (id: string) => {
    await deletePanoramaMutation({ variables: { id } });
    dispatch(removePanorama(id));
  };

  return { deletePanorama, loading, error };
}
