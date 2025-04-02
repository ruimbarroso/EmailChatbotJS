import { JSX } from "react";
import { useAuth } from "../contexts/Contexts";
import { LoadingPoints } from "./LoadingPoints";

export const ProtectedPage = ({protectedPageBuilder, authPageBuilder}:{protectedPageBuilder: ()=>JSX.Element, authPageBuilder: ()=>JSX.Element})=>{
    const {isLoggedIn, isLoadingUser} = useAuth();

    return <>{isLoadingUser? <div className="flex items-center justify-center h-dvh w-dvw"> <LoadingPoints/> </div> : isLoggedIn()? protectedPageBuilder() : authPageBuilder()}</>
};