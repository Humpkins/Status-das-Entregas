import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const Loading = ({ tipo }) => {
    const ulEstilosa = {
        padding: '30px',
        background:( tipo === 'carregamento' )?'rgba( 227, 241, 255 )':'#333F4F',
        height: '100%',
    };

    const liEstilosa = {
        marginTop: '20px'
    };


    return(
        <ul style={ulEstilosa}>
            <li >
                <SkeletonTheme color='rgba(255, 255, 255, 0.2)' >
                    <Skeleton height={90}duration={1} delay={0.2}/>
                </ SkeletonTheme>
            </li>

            <li style={liEstilosa}>
                <SkeletonTheme color='rgba(255, 255, 255, 0.1)'>
                    <Skeleton height={90} duration={1.1} delay={0.1}/>
                </ SkeletonTheme>
            </li>

            <li style={liEstilosa}>
                <SkeletonTheme color='rgba(255, 255, 255, 0.05)'>
                    <Skeleton height={90} duration={1.2} delay={0}/>
                </ SkeletonTheme>
            </li>

        </ul>
    );
};

export default Loading;