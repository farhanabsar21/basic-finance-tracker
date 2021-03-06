import { useState, useEffect, useReducer } from 'react'
import { projectFirestore, timestamp } from "../firebase/config";

let initialState = {
    document: null,
    isPending: false,
    error: null,
    success: null
} 

const firestoreReducer = (state, action) => {
    switch(action.type){
        case 'IS_PENDING':
            return {isPending: true, document: null, error: null, success: null}
        case 'ADD_DOCUMENT':
            return {isPending: false, document: action.payload, error: null, success: true}
        case 'DELETE_DOCUMENT':
                return {isPending: false, document: null, error: null, success: true}
        case 'ERROR':
            return {isPending: false, document: null, success: null, error: action.payload}
        default:
            return state
    }
}
export const useFirebase = (collection) => {

    const [response, dispatch] = useReducer(firestoreReducer, initialState)
    const [isCancelled, setIsCancelled] = useState(false)

    // ref collection
    const ref = projectFirestore.collection(collection)

    // dispatch common unmount
    const dispatchIfNotCancelled = (action) => {
        if(!isCancelled){
            dispatch(action)
        }
    }

    //add document
    const addDocument = async (doc) => {
        dispatch({type: 'IS_PENDING'})

        try{
            const createdAt = timestamp.fromDate(new Date())
            const addDocument = await ref.add({...doc, createdAt})
            dispatchIfNotCancelled({type: 'ADD_DOCUMENT', payload: addDocument})

        }catch(err){
            dispatchIfNotCancelled({type: 'ERROR', payload: err.message})
        }
    }

    // delete document
    const deleteDocument = async (id) => {
        dispatch({type: 'IS_PENDING'})

        try{
            await ref.doc(id).delete()
            dispatchIfNotCancelled({type: 'DELETE_DOCUMENT'})
        }
        catch(err){
            dispatchIfNotCancelled({type: 'ERROR', payload: err.message})
        }
    }

    useEffect(() => {
        return () => setIsCancelled(true)  
    }, [])

    return { response, addDocument, deleteDocument }
}
