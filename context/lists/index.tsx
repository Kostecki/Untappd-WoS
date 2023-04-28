import { ReactNode, createContext, useContext, useState } from "react";

import { useSession } from "next-auth/react";
import Cookies from "universal-cookie";

type listsContextType = {
  loading: boolean;
  userLists: UserList[];
  fetchUserLists: () => void;
};

const listsContextValues: listsContextType = {
  loading: false,
  userLists: [],
  fetchUserLists: () => {},
};

const ListsContext = createContext<listsContextType>(listsContextValues);

export function useLists() {
  return useContext(ListsContext);
}

type Props = {
  children: ReactNode;
};

export function ListsProvider({ children }: Props) {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [userLists, setUserLists] = useState<UserList[]>([]);

  const fetchUserLists = async () => {
    setLoading(true);

    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      fetch(`${apiBase}/custom_lists/userlists?access_token=${accessToken}`)
        .then((response) => response.json())
        .then((data) => {
          const lists = data.response.items;
          setUserLists(lists);
          setLoading(false);
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  const value = {
    loading,
    userLists,
    fetchUserLists,
  };

  return (
    <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
  );
}
