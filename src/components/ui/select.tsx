'use client';
import * as SelectPrimitive from '@radix-ui/react-select';
import {Check,ChevronDown,ChevronUp} from 'lucide-react';

export type SelectOption={value:string;label:string};
type Props={
 id:string;value:string;onValueChange:(value:string)=>void;
 options:readonly SelectOption[];placeholder?:string;disabled?:boolean;
};

export function UiSelect({id,value,onValueChange,options,placeholder='Seleccionar',disabled}:Props){
 return <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
  <SelectPrimitive.Trigger id={id} className="ui-select-trigger" aria-label={undefined} data-cuelume-select>
   <SelectPrimitive.Value placeholder={placeholder}/>
   <SelectPrimitive.Icon asChild><ChevronDown size={17} strokeWidth={1.7} aria-hidden="true"/></SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
  <SelectPrimitive.Portal>
   <SelectPrimitive.Content position="popper" sideOffset={7} collisionPadding={12} className="ui-select-content">
    <SelectPrimitive.ScrollUpButton className="ui-select-scroll"><ChevronUp size={16}/></SelectPrimitive.ScrollUpButton>
    <SelectPrimitive.Viewport className="ui-select-viewport">
     {options.map(option=><SelectPrimitive.Item key={option.value} value={option.value} className="ui-select-option">
      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ui-select-check"><Check size={17}/></SelectPrimitive.ItemIndicator>
     </SelectPrimitive.Item>)}
    </SelectPrimitive.Viewport>
    <SelectPrimitive.ScrollDownButton className="ui-select-scroll"><ChevronDown size={16}/></SelectPrimitive.ScrollDownButton>
   </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
 </SelectPrimitive.Root>;
}
