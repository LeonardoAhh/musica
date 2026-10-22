'use client';
import {Toaster,toast} from 'sonner';
import {CircleAlert,CircleCheck,Info} from 'lucide-react';

type ToastMessage=string;
export const notify={
 success(message:ToastMessage){toast.success(message,{duration:3200})},
 error(message:ToastMessage){toast.error(message,{duration:5000})},
 info(message:ToastMessage){toast(message,{duration:3500})}
};

export function UiToaster(){
 return <Toaster icons={{success:<CircleCheck size={18}/>,error:<CircleAlert size={18}/>,info:<Info size={18}/>}} position="bottom-right" closeButton richColors={false} theme="light" duration={3500} gap={10} visibleToasts={3} toastOptions={{classNames:{
  toast:'ui-toast',
  title:'ui-toast-title',
  description:'ui-toast-description',
  closeButton:'ui-toast-dismiss'
 }}}/>;
}
