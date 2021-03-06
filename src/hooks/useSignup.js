import { useEffect, useState } from "react"
import { projectAuth } from "../firebase/config"
import { useAuthContext } from "./useAuthContext"

export const useSignUp = () => {
    
    const { dispatch } = useAuthContext()
    const [error, setError] = useState(null)
    const [isPending, setIsPending] = useState(false)

    // clean up state
    const [isCancel, setIsCancelled] = useState(false)

    const signUp = async (email, password, displayName) => {
        setError(null)
        setIsPending(true)

        try{
            const res = await projectAuth.createUserWithEmailAndPassword(email, password)
            if(!res){
                throw new Error('could not complete sign up')
            }
            await res.user.updateProfile({displayName: displayName})
            dispatch({
                type: 'LOGIN',
                payload: res.user 
            })
            // update state according to clean up
            if(!isCancel){
                setIsPending(false)
                setError(null)
            }

        }catch (err){
            if(!isCancel){
                console.log(err.message)
                setError(err.message)
                setIsPending(false)
            }
        }
    }

    useEffect(() => {
        return () => setIsCancelled(true)
    }, [])

    return { error, isPending, signUp }
}