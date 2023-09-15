import { auth, db} from '@/lib/firebase';
import { collection, getDoc, doc, onSnapshot} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

// Custom hook to read auth record and user profile doc
export function useUserData() {
  const [user, loading, error] = useAuthState(auth);
  const [role, setRole] = useState("noob");

  useEffect(() => {
    let unsubscribe;

    if (user) {
      const ref = doc(collection(db, 'users'), user.uid);
      unsubscribe = onSnapshot(ref, (doc) => {
        setRole(doc.data()?.role);
      });
    } else {
      setRole("noob");
    }
    return unsubscribe;
  }, [user]);

  return { user, role };
}