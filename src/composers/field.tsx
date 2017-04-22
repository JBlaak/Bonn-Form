import * as React from 'react';
import {FormProps} from './bonn';
import {FieldState} from '../business/form';
export interface FieldProps {
    value: any;
    validationError: string | undefined;
    onChange: (value: any) => void;
}

interface OwnProps {
    name?: string;
    value?: string;
}

type IncomingField<Props> = new () => React.Component<Props & FieldProps, any>;
type OutgoingField<Props> = new () => React.Component<Props & FormProps, any> ;

export function Field<Props>(WrappedComponent: IncomingField<Props>,
                             fieldName: string | null = null): OutgoingField<Props & OwnProps> {

    return class extends React.Component<Props & OwnProps & FormProps, { value: any }> {

        public state: { value: any } = {
            value: (typeof this.props.form.getFieldState(this.getFieldName()) !== 'undefined')
                ? (this.props.form.getFieldState(this.getFieldName()) as FieldState).value
                : ''
        };

        public getFieldName(): string {
            if (fieldName !== null) {
                return fieldName;
            }
            const nameFromProp = this.props.name;
            if (typeof nameFromProp === 'string') {
                return nameFromProp;
            }
            throw new Error('Could not resolve field name');
        }

        public componentWillMount() {
            if (typeof this.props.value !== 'undefined') {
                this.props.form.setFieldValue(this.getFieldName(), this.props.value, true);
            }
        }

        public componentWillUpdate(nextProps: Props & OwnProps & FormProps) {
            if (typeof nextProps.value !== 'undefined' && this.props.value !== nextProps.value) {
                this.props.form.setFieldValue(this.getFieldName(), nextProps.value, true);
            }
        }

        public componentDidMount() {
            this.props.form.listenForFieldChange(this.getFieldName(), (value: any) => {
                this.setState({
                    value: value
                });
            });
        }

        private handleChange(value: any) {
            this.props.form.setFieldValue(this.getFieldName(), value, false);
        }

        public render() {
            const fieldState = this.props.form.getFieldState(this.getFieldName());
            return <WrappedComponent
                {...this.props}
                value={this.state.value}
                validationError={(typeof fieldState !== 'undefined') ? fieldState.validationError : undefined}
                onChange={this.handleChange.bind(this)}
            />;
        }
    };
}
