'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {DialogHeader} from '@/components/ui/dialog-header';

type Props={open:boolean;onOpenChange:(open:boolean)=>void;titleId:string;headerLabel:ReactNode;closeLabel:string;children:ReactNode;className?:string};

/** Focus-managed native dialog that becomes a bottom sheet on small screens. */
export function ResponsiveDialog({open,onOpenChange,titleId,headerLabel,closeLabel,children,className}:Props){
 const dialogRef=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const dialog=dialogRef.current;
  if(!dialog)return;
  if(open&&!dialog.open){dialog.showModal();dialog.querySelector<HTMLElement>('[data-dialog-initial-focus]')?.focus({preventScroll:true})}
  if(!open&&dialog.open)dialog.close();
 },[open]);
 return <dialog ref={dialogRef} className={`ui-responsive-dialog${className?` ${className}`:''}`} aria-labelledby={titleId}
  onCancel={event=>{event.preventDefault();onOpenChange(false)}}
  onClick={event=>{if(event.target===event.currentTarget)onOpenChange(false)}}>
  <DialogHeader label={headerLabel} closeLabel={closeLabel} onClose={()=>onOpenChange(false)}/>
  {children}
 </dialog>;
}
