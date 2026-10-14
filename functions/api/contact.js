import {handleContact} from '../../lib/contact-service.mjs';
export const onRequest=({request,env})=>handleContact(request,env);
