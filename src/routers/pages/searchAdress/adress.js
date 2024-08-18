import React, { useState, useEffect, useCallback } from 'react';
import * as Realm from 'realm-web';
import styles from './styles.module.css'; // Import CSS Module

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const LocationSelector = () => {
  const [data, setData] = useState([]);
  const [listCityEnums, setListCityEnums] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  const [listDistrictEnums, setListDistrictEnums] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [listCommunesWardsEnums, setListCommunesWardsEnums] = useState([]);
  const [selectedCommunesWards, setSelectedCommunesWards] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedData = localStorage.getItem('administrativeData');
        if (savedData) {
          setData(JSON.parse(savedData));
        } else {
          const functionName = 'callAdministrativeUnit';
          const response = await app?.currentUser?.callFunction(functionName);
          if (response) {
            setData(response);
            localStorage.setItem('administrativeData', JSON.stringify(response));
          }
        }
      } catch (error) {
        console.log('Error fetching data:', error.message);
      }
    };
  
    fetchData();
  }, []);
  
  const listCity = useCallback(() => {
    const uniqueCities = data
      .filter(item => item !== undefined)
      .filter((item, index, self) => index === self.findIndex((t) => t["Mã TP"] === item["Mã TP"]))
      .map(item => item["Tình/ Thành Phố"])
      .filter(name => name !== undefined && name !== null)
      setListCityEnums(uniqueCities.map(name => name.replace(/Tỉnh|Thành phố/g, '').trim()));
  }, [data]);

  useEffect(() => {
    listCity();
  }, [listCity]);

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
    setSelectedDistrict('');
  };

  const listDistrict = useCallback(() => {
    if (selectedCity.length > 0) {
      const uniqueDistricts = data
        .filter(item => item !== undefined && item["Tình/ Thành Phố"])
        .filter(item => {
          const cityName = item["Tình/ Thành Phố"]
            .replace(/Tỉnh|Thành phố/g, '')
            .trim();
          return cityName === selectedCity;
        })
        .map(item => item["Quận/ Huyện"])
        .filter(district => district !== undefined && district !== null);
  
      const distinctDistricts = [...new Set(uniqueDistricts)];
  
      setListDistrictEnums(distinctDistricts);
      return distinctDistricts;
    }
    return '';
  }, [data, selectedCity]);
  

  useEffect(() => {
    listDistrict();
  }, [listDistrict]);

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
    setSelectedCommunesWards('');
  };

  const listCommunesWards = useCallback(() => {
    if (selectedCity.length > 0 && selectedDistrict.length > 0) {
      const uniqueCommunesWards = data
        .filter(item => item !== undefined && item["Tình/ Thành Phố"])
        .filter(item => {
          const cityName = item["Tình/ Thành Phố"]
            .replace(/Tỉnh|Thành phố/g, '')
            .trim();
          return cityName === selectedCity;
        })
        .filter(item => {
          const districtName = item["Quận/ Huyện"]
          return districtName === selectedDistrict;
        })
        .map(item => item["Tên"])
        .filter(district => district !== undefined && district !== null);
  
      const distinctCommunesWards = [...new Set(uniqueCommunesWards)];
  
      setListCommunesWardsEnums(distinctCommunesWards);
      return distinctCommunesWards;
    }
    return '';
  }, [data, selectedCity, selectedDistrict]);
  

  useEffect(() => {
    listCommunesWards();
  }, [listCommunesWards]);

  const handleCommunesWardsChange = (event) => {
    setSelectedCommunesWards(event.target.value);
  };

  if (data.length === 0) {
    return <div className={styles.notLogin}>Loading...</div>;
  }

  return (
    <div>
      <h1>Chọn Địa phương</h1>
      
      <label>
        Tỉnh/Thành phố:
        <select value={selectedCity} onChange={handleCityChange}>
          <option value="">Chọn tỉnh/thành phố</option>
          {listCityEnums.map((city, index) => (
            <option key={index} value={city}>{city}</option>
          ))}
        </select>
      </label>

      <label>
        Quận/Huyện:
        <select value={selectedDistrict} onChange={handleDistrictChange}>
          <option value="">Chọn quận/huyện</option>
          {listDistrictEnums.map((district, index) => (
            <option key={index} value={district}>{district}</option>
          ))}
        </select>
      </label>
      
      <label>
        Xã/Phường:
        <select value={selectedCommunesWards} onChange={handleCommunesWardsChange}>
          <option value="">Chọn phường/xã</option>
          {listCommunesWardsEnums.map((district, index) => (
            <option key={index} value={district}>{district}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default LocationSelector;
