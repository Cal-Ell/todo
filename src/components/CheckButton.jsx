import React from 'react';
import { motion, useTransform, useMotionValue } from 'framer-motion';
import styles from '../styles/todoItem.module.css';

const checkVariants = {
    initial: {
      color: '#fff',
    },
    completed: { pathLength: 1 },
    incompleted: { pathLength: 0 },
  };
  
  const boxVariants = {
    checked: {
      background: 'var(--primaryPurple)',
      transition: { duration: 0.1 },
    },
    incompleted: { background: 'var(--gray-2)', transition: { duration: 0.1 } },
  };

function CheckButton({ completed, handleUpdate }) {
    const pathLength = useMotionValue(0);
    const opacity = useTransform(pathLength, [0.05, 0.15], [0, 1]);
  
    return (
      <motion.div
        animate={completed ? 'completed' : 'incomplete'}
        className={styles.svgBox}
        variants={boxVariants}
        onClick={() => handleUpdate()}
      >
        <motion.svg
          className={styles.svg}
          viewBox="0 0 53 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            variants={checkVariants}
            animate={completed ? 'completed' : 'incomplete'}
            style={{ pathLength, opacity }}
            fill="none"
            strokeMiterlimit="10"
            strokeWidth="6"
            d="M1.5 22L16 36.5L51.5 1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </motion.svg>
      </motion.div>
    );
  }

export default CheckButton