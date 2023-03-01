import React from 'react';
import styles from '../styles/button.module.css';

function Button({children, ...rest}){
    return(
        <button className={styles.button} {...rest}>
            {children}
        </button>
    )
}

export default Button