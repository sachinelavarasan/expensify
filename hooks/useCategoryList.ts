import { ICategory } from '@/types';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const queryKeys = {
  categories: ['categories'] as const,
};

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       setLoading(true);
//       setError(null);

//     //   try {
//     //     const querySnapshot = await firestore().collection('category').get();
//     //     const categoryList: Category[] = querySnapshot.docs.map((doc) => ({
//     //       id: doc.id,
//     //       ...doc.data(),
//     //     })) as Category[];
//     // } catch (err) {
//     //     setError('Failed to fetch categories');
//     //     console.error(err);
//     // } finally {
//     // }
//     setLoading(false);
// };
// setCategories([]);

//     fetchCategories();
//   }, []);

//   return { categories, loading, error };
// };

// export default useCategoryList;

const useCategoryList = () => {
  const { getToken, userId } = useAuth();

  if (!userId) {
    throw new Error('User is not authenticated');
  }
  const {
    data: categories = [],
    isLoading: loading,
    isError,
    error,
  } = useQuery<ICategory[], Error>({
    queryKey: queryKeys.categories,
    queryFn: async ({ queryKey }): Promise<ICategory[]> => {
      const token = await getToken();

      const response = await fetch(`${API_URL}/expensify/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as ICategory[];
    },
  });

  return {
    categories,
    loading,
    error: isError ? error?.message : null,
  };
};

export default useCategoryList;
