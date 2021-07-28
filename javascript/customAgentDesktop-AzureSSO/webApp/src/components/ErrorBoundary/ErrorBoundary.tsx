import React, { ErrorInfo } from 'react';
import Logger from '../../util/logger/logger';

interface Props { };

interface State {
    error: string | null
};

class ErrorBoundary extends React.Component<Props, State> {
    private readonly _name = 'ErrorBoundary';
    private readonly _logger = Logger.getInstance().getLogger();

    constructor(props: Props) {
        super(props);
        this._logger.debug(this._name + ': constructor');

        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return ({ error: error.message });
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        this._logger.debug(this._name + ': componentDidCatch');
        this._logger.debug(error);
        this._logger.debug(info);
    }

    render() {
        this._logger.debug(this._name + ': render');

        if (this.state.error) {
            return (
                <div>
                    <h1>An error occurred :(</h1>
                    <p>{this.state.error}</p>
                </div>
            )
        } else {
            return this.props.children;
        }
    }
}

export default ErrorBoundary;