import { Snackbar } from "@mui/joy";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const context = createContext({ showSnackbar: () => {} });
const { Provider } = context;

let snackId = 0;

export const SnackbarsProvider = ({ children }) => {
  const [list, setList] = useState([]);

  const showSnackbar = useCallback((content, props) => {
    setList((list) => {
      return [
        {
          id: ++snackId,
          content,
          props: {
            open: true,
            anchorOrigin: { vertical: "top", horizontal: "center" },
            autoHideDuration: 3000,
            ...props,
          },
        },
        ...list,
      ];
    });
  }, []);

  const handleClose = useCallback((id) => {
    setList((list) => list.filter((item) => item.id !== id));
  }, []);

  const api = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <Provider value={api}>
      {list.map(({ id, content, props }) => (
        <Snackbar key={id} {...props} onClose={() => handleClose(id)}>
          {content}
        </Snackbar>
      ))}
      {children}
    </Provider>
  );
};

export const useSnackbars = () => useContext(context);
