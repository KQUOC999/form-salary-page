import React, { useState, useEffect } from 'react';
import * as Realm from 'realm-web';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initUser = async () => {
            try {
                if (!app.currentUser) {
                    await app.logIn(Realm.Credentials.anonymous());
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error initializing user:', error);
                setError('Error initializing user');
                setIsLoading(false);
            }
        };

        initUser();
    }, []);

    useEffect(() => {
        const storedResults = localStorage.getItem('searchResults');
        if (storedResults) {
            setResults(JSON.parse(storedResults));
            setSearched(true);
        }
    }, []);

    const handleSearch = async () => {
        if (!searchTerm) {
            setError('Search term is empty');
            return;
        }

        setIsLoading(true);
        setError('');
        setSearched(true);

        try {
            const user = app.currentUser;

            if (!user) {
                console.error('User is not logged in');
                setError('User is not logged in');
                setIsLoading(false);
                return;
            }

            const response = await user.functions.searchQuery(searchTerm);

            if (response.length === 0) {
                setResults([]);
                setError('Không tìm thấy');
            } else {
                setResults(response);
                setError('');
            }

            localStorage.setItem('searchResults', JSON.stringify(response));
        } catch (error) {
            console.error('Error calling searchQuery:', error);
            setError('Error calling searchQuery');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        setResults([]);
        setError('');
        setSearched(false);
        setSearchTerm('');
        localStorage.removeItem('searchResults');
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Search MongoDB</h1>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter search term"
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={handleRefresh}>Refresh</button>

            {error && <div>{error}</div>}

            {searched && results.length === 0 && !error && <div>Không tìm thấy</div>}

            <ul>
                {Array.isArray(results) && results.map((item, index) => (
                    <li key={index}>
                        {/* Hiển thị thông tin kết quả ở đây */}
                        {JSON.stringify(item)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Search;
