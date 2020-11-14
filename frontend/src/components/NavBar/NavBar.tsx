import React from "react";
import {useDispatch} from 'react-redux'

import styles from './styles.module.scss'
import Logo from "./../../resources/lsn-ic.png";
import {SearchBar} from "../SearchBar/SearchBar";
import {logOutUser} from "../../modules/Auth/authActions";
import classNames from "classnames";
import {CurrentProfileLink} from "../CurrentProfileLink/CurrentProfileLink";
import {Link} from "react-router-dom";
import {Dropdown} from "../Dropdown/Dropdown";
import {ConversationsList} from "./Conversations/ConversationsList";

export const NavBar = () => {
    const dispatch = useDispatch()
    // const isLoggingOut = useSelector((state: AppState) => state.auth.isLoggingOut)
    const handleLogOut = () => dispatch(logOutUser());


    return (
        <div className={styles.navContainer}>
            <div className={styles.navBar}>
                <div className={styles.leftHeader}>
                    <div className={styles.newsFeedType}>
                        <ul className={styles.selected}>
                            <Link to={'/'}>Top</Link>
                        </ul>
                        <ul>
                            <Link to={'/'}>Latest</Link>
                        </ul>
                    </div>
                    <SearchBar className={styles.search}/>
                </div>
                <div className={styles.logoContainer}>
                    <span style={{
                        fontWeight: 600,
                        width: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '46px',
                        backgroundColor: '#469EFA',
                        borderRadius: '50%',
                        color: '#fff'
                    }}>LSN</span>
                    {/*<img src={Logo}/>*/}
                </div>
                <div className={styles.rightHeader}>
                    <CurrentProfileLink className={styles.profileLink}/>
                    <ConversationsList/>
                    <i className={classNames(styles.icon, "fas fa-bell")}/>
                    <Dropdown trigger={<i className={classNames(styles.icon, "fas fa-bars")}/>}>
                        <Dropdown.Item
                            label={'Settings'}
                            onClick={() => {
                                // TODO (Implement this feature to send to /settings)
                                console.log('Settings clicked!');
                            }}
                            icon={() => <i className="fas fa-cog"/>}/>
                        <Dropdown.Item
                            label={'Log out'}
                            onClick={() => {
                                handleLogOut()
                            }}
                            icon={() => <i className="fas fa-sign-out-alt"/>}/>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
};