'use client';
import * as Alert from '@radix-ui/react-alert-dialog';
import {AlertCircle} from 'lucide-react';
type Props={
 open:boolean;onOpenChange:(open:boolean)=>void;
 title:string;description:string;confirmLabel:string;onConfirm:()=>void;
 busy?:boolean;
};
export function ConfirmDialog({open,onOpenChange,title,description,confirmLabel,onConfirm,busy=false}:Props){
 return <Alert.Root open={open} onOpenChange={onOpenChange}>
  <Alert.Portal>
   <Alert.Overlay className="ui-alert-overlay"/>
   <Alert.Content className="ui-alert-content">
    <div className="ui-alert-icon"><AlertCircle size={21} aria-hidden="true"/></div>
    <Alert.Title className="ui-alert-title">{title}</Alert.Title>
    <Alert.Description className="ui-alert-description">{description}</Alert.Description>
    <div className="ui-alert-actions">
     <Alert.Cancel className="outline-button" disabled={busy}>Cancelar</Alert.Cancel>
     <Alert.Action className="ink-button" disabled={busy} onClick={onConfirm}>{confirmLabel}</Alert.Action>
    </div>
   </Alert.Content>
  </Alert.Portal>
 </Alert.Root>;
}
