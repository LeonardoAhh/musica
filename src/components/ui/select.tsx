'use client';
import {useEffect,useRef,useState} from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import {Check,ChevronDown,ChevronUp} from 'lucide-react';
import type {ReactNode} from 'react';

export type SelectOption={value:string;label:string};
type Props={
 id:string;value:string;onValueChange:(value:string)=>void;
 options:readonly SelectOption[];placeholder?:string;disabled?:boolean;leadingIcon?:ReactNode;
};

export function UiSelect({id,value,onValueChange,options,placeholder='Seleccionar',disabled,leadingIcon}:Props){
 const triggerRef=useRef<HTMLButtonElement>(null);
 const [portalContainer,setPortalContainer]=useState<HTMLDialogElement|null>(null);
 useEffect(()=>{setPortalContainer(triggerRef.current?.closest('dialog')??null)},[]);
 return <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
  <SelectPrimitive.Trigger ref={triggerRef} id={id} className="ui-select-trigger" data-cuelume-select>
   {leadingIcon&&<span className="ui-select-leading-icon" aria-hidden="true">{leadingIcon}</span>}
   <SelectPrimitive.Value className="ui-select-value" placeholder={placeholder}/>
   <SelectPrimitive.Icon asChild><ChevronDown size={17} strokeWidth={1.7} aria-hidden="true"/></SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
  <SelectPrimitive.Portal container={portalContainer??undefined}>
   <SelectPrimitive.Content position="popper" sideOffset={7} collisionPadding={12} className="ui-select-content">
    <SelectPrimitive.ScrollUpButton className="ui-select-scroll"><ChevronUp size={16} aria-hidden="true"/></SelectPrimitive.ScrollUpButton>
    <SelectPrimitive.Viewport className="ui-select-viewport">
     {options.map(option=><SelectPrimitive.Item key={option.value} value={option.value} className="ui-select-option">
      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ui-select-check"><Check size={17} aria-hidden="true"/></SelectPrimitive.ItemIndicator>
     </SelectPrimitive.Item>)}
    </SelectPrimitive.Viewport>
    <SelectPrimitive.ScrollDownButton className="ui-select-scroll"><ChevronDown size={16} aria-hidden="true"/></SelectPrimitive.ScrollDownButton>
   </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
 </SelectPrimitive.Root>;
}
