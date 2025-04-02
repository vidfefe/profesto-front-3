// returns object which is persisted in local storage
export const getStorageObject = (key, type = 'json') => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return type === 'string' ? serializedState : JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};


// overwrite new state
export const saveStorageObject = (key, state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (err) {
    // do something with write error.
  }
};


export const getToken = () => {
  const token = JSON.parse(localStorage.getItem("token"));
  if (!token) return null;
  return token;
};

export const getRefreshToken = () => {
  const token = JSON.parse(localStorage.getItem("refresh_token"));
  if (!token) return null;
  return token;
};


export const deleteToken = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("refresh_token")
};


export const removeStorageProperties = (name, properties) => {
  const clearedStorage = getStorageObject(name);

  properties.forEach((item) => {
    delete clearedStorage[item];
  });

  localStorage.setItem(name, JSON.stringify(clearedStorage));
};



export const changeStorageItemProperty = (objectName, propertyName, data) => {
  var retrievedObject = localStorage.getItem(objectName);

  if (!retrievedObject) {
    localStorage.setItem(
      objectName,
      JSON.stringify({ [propertyName]: data })
    );
  } else {
    var stored = JSON.parse(retrievedObject);
    stored[propertyName] = data;
    localStorage.setItem(objectName, JSON.stringify(stored));
  }
};