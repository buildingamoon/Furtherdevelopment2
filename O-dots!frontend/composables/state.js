// USE SESSION STATE

export const useSession = () => useState('session', () => ({ pending: true, data: null }));



// SET SESSION STATE

export const useSetSession = (data) => {

 // save session state to a cookie

 const sessionCookie = useCookie('session', {

   maxAge: 60 * 60 * 24 * 7, // 1 week

   sameSite: 'strict',

   secure: process.env.NODE_ENV === 'production'

 })

 sessionCookie.value = data;  // Store the data directly, no need to stringify



 // update session state

 const sessionState = useSession()

 sessionState.value = { pending: false, data }

}



export const getUser = () => {

 const sessionCookie = useCookie('session')

 return sessionCookie.value || null  // Return the value directly, no need to parse

}



// Helper function to clear the session

export const clearSession = () => {

 const sessionCookie = useCookie('session')

 sessionCookie.value = null

 const sessionState = useSession()

 sessionState.value = { pending: true, data: null }

}

/*

// USE SESSION STATE

export const useSession = () => useState('session', () => ({ pending: true, data: null }));



// SET SESSION STATE

export const useSetSession = (data) => {

 // save session state to localStorage

 localStorage.setItem('session', JSON.stringify(data));



 // update session state

 const sessionState = useSession();

 sessionState.value = { pending: false, data };

};



export const getUser = () => {

 if (import.meta.client) {

   return JSON.parse(localStorage.getItem('session'));

 }

};

*/