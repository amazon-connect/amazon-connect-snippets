/** ****************************************************************************
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not
 *  use this file except in compliance with the License. A copy of the License
 *  is located at
 *
 *      http://www.apache.org/licenses/
 *  or in the 'license' file accompanying this file. This file is distributed on
 *  an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 *  implied. See the License for the specific language governing permissions and
 *  limitations under the License.
***************************************************************************** */

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const themes = {
    light: {
        name: 'light',
        colors: {
            background: '#f5f5f5',
            surface: '#ffffff',
            surfaceSecondary: '#f7f7f7',
            appBar: '#26303b',
            tabs: '#2e3a48',
            textPrimary: '#222222',
            textSecondary: '#616161',
            textInverse: '#ffffff',
            border: '#e0e0e0',
            hover: 'rgba(0,0,0,0.1)',
            selected: 'rgba(255,255,0,0.3)',
            moreInfo: '#f5f5f588',
            iconSecondary: 'rgba(0,0,0,0.25)',
            textMuted: 'rgba(0,0,0,0.5)',
            logTrace: '#616161',
            logLog: '#616161',
        },
    },
    dark: {
        name: 'dark',
        colors: {
            // VS Code Dark Modern theme colors
            background: '#1f1f1f',
            surface: '#181818',
            surfaceSecondary: '#252526',
            appBar: '#181818',
            tabs: '#252526',
            textPrimary: '#cccccc',
            textSecondary: '#9d9d9d',
            textInverse: '#1f1f1f',
            border: '#3c3c3c',
            hover: 'rgba(90, 93, 94, 0.31)',
            selected: 'rgba(4, 57, 94, 0.8)',
            moreInfo: '#252526',
            iconSecondary: 'rgba(204, 204, 204, 0.4)',
            textMuted: 'rgba(204, 204, 204, 0.7)',
            logTrace: '#9d9d9d',
            logLog: '#9d9d9d',
        },
    },
};

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState('light');

    const toggleTheme = () => {
        setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
    };

    const setTheme = (themeName) => {
        setCurrentTheme(themeName);
    };

    const theme = themes[currentTheme];

    return (
        <ThemeContext.Provider
            value={{
                theme,
                currentTheme,
                toggleTheme,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
