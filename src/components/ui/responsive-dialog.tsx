'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {DialogHeader} from '@/components/ui/dialog-header';

let activeLocks=0;
let restoreDocumentScroll:(()=>void)|null=null;

function lockDocumentScroll(){
 activeLocks+=1;
 if(activeLocks>1)return;
 const scrollY=window.scrollY;
 const body=document.body;
 const html=document.documentElement;
 const previous={
  bodyPosition:body.style.position,
  bodyTop:body.style.top,
  bodyLeft:body.style.left,
  bodyRight:body.style.right,
  bodyWidth:body.style.width,
  htmlOverflow:html.style.overflow,
 };
 html.style.overflow='hidden';
 body.style.position='fixed';
 body.style.top=`-${scrollY}px`;
 body.style.left='0';
 body.style.right='0';
 body.style.width='100%';
 restoreDocumentScroll=()=>{
  body.style.position=previous.bodyPosition;
  body.style.top=previous.bodyTop;
  body.style.left=previous.bodyLeft;
  body.style.right=previous.bodyRight;
  body.style.width=previous.bodyWidth;
  html.style.overflow=previous.htmlOverflow;
  window.scrollTo(0,scrollY);
 };
}

function unlockDocumentScroll(){
 activeLocks=Math.max(0,activeLocks-1);
 if(activeLocks!==0)return;
 restoreDocumentScroll?.();
 restoreDocumentScroll=null;
}

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
 useEffect(()=>{
  if(!open)return;
  lockDocumentScroll();
  return()=>unlockDocumentScroll();
 },[open]);
 return <dialog ref={dialogRef} className={`ui-responsive-dialog${className?` ${className}`:''}`} aria-labelledby={titleId}
  onCancel={event=>{event.preventDefault();onOpenChange(false)}}
  onClick={event=>{if(event.target===event.currentTarget)onOpenChange(false)}}>
  <DialogHeader label={headerLabel} closeLabel={closeLabel} onClose={()=>onOpenChange(false)}/>
  {children}
 </dialog>;
}
