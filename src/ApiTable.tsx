import { useEffect, useState } from "react";

interface FlattenedLocationsInterface {
  headers: string[];
  data: FlattenedData[];
}

interface FlattenedData {
  number: number;
  name: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  latitude: string;
  longitude: string;
  offset: string;
  description: string;
}

interface Name {
  title: string;
  first: string;
  last: string;
}

interface Street {
  number: number;
  name: string;
}

interface Coordinates {
  latitude: string;
  longitude: string;
}

interface Timezone {
  offset: string;
  description: string;
}

interface Location {
  street: Street;
  city: string;
  state: string;
  country: string;
  postcode: any;
  coordinates: Coordinates;
  timezone: Timezone;
}

interface Login {
  uuid: string;
  username: string;
  password: string;
  salt: string;
  md5: string;
  sha1: string;
  sha256: string;
}

interface Dob {
  date: Date;
  age: number;
}

interface Registered {
  date: Date;
  age: number;
}

interface Id {
  name: string;
  value: string;
}

interface Picture {
  large: string;
  medium: string;
  thumbnail: string;
}

interface RootObject {
  gender: string;
  name: Name;
  location: Location;
  email: string;
  login: Login;
  dob: Dob;
  registered: Registered;
  phone: string;
  cell: string;
  id: Id;
  picture: Picture;
  nat: string;
}

const ApiTable = () => {
  const [data, setData] = useState<FlattenedLocationsInterface>({
    headers: [],
    data: [],
  });
  const [flattenedLocations, setFlattenedLocations] =
    useState<FlattenedLocationsInterface>({
      headers: [],
      data: [],
    });

  const [searchInput, setSearchInput] = useState("");

  const flattenObject = (obj: any) => {
    let result: any = {};

    for (const i in obj) {
      if (typeof obj[i] === "object" && !Array.isArray(obj[i])) {
        const temp = flattenObject(obj[i]);
        for (const j in temp) {
          result[j] = temp[j];
        }
      } else {
        result[i] = obj[i];
      }
    }
    return result;
  };

  const getNestedObjectKeys = (obj: Location) => {
    const flattenedObject = flattenObject(obj);
    return Object.keys(flattenedObject);
  };

  const flattenData = (data: RootObject[]) => {
    let dataArray = data.map((obj: RootObject) => {
      return flattenObject(obj.location);
    });

    const flattenedLocationHeaders = getNestedObjectKeys(data[0].location);
    setFlattenedLocations({
      headers: flattenedLocationHeaders,
      data: dataArray,
    });

    setData({
      headers: flattenedLocationHeaders,
      data: dataArray,
    });
  };

  const filterRows = (searchValue: any) => {
    setSearchInput(searchValue);
    if (searchInput !== "") {
      const filteredRows = flattenedLocations.data.filter((item) => {
        return Object.values(item)
          .join("")
          .toLowerCase()
          .includes(searchInput.toLowerCase());
      });
      setFlattenedLocations({
        ...flattenedLocations,
        data: filteredRows,
      });
    } else {
      setFlattenedLocations({ ...flattenedLocations });
    }
  };

  useEffect(() => {
    const url = "https://randomuser.me/api/?results=20";

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        flattenData(json.results);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => filterRows(e.target.value)}
      />
      <table>
        <thead>
          {flattenedLocations.headers.map((header: string, index: number) => {
            return <th key={index}>{header}</th>;
          })}
        </thead>
        <tbody>
          {searchInput.length > 1
            ? flattenedLocations.data.map(
                (row: FlattenedData, index: number) => {
                  return (
                    <tr>
                      {flattenedLocations.headers.map(
                        (header: string, index: number) => {
                          return (
                            <td key={index}>
                              {row[header as keyof typeof row]}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  );
                }
              )
            : data.data.map((row: FlattenedData, index: number) => {
                return (
                  <tr>
                    {flattenedLocations.headers.map(
                      (header: string, index: number) => {
                        return (
                          <td key={index}>{row[header as keyof typeof row]}</td>
                        );
                      }
                    )}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
};

export default ApiTable;
