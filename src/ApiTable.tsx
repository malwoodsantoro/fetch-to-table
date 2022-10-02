import { useEffect, useState } from "react";
import styled from "styled-components";

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

enum SortingDirection {
  ASCENDING = "ASCENDING",
  DESCENDING = "DESCENDING",
  UNSORTED = "UNSORTED",
}

////

const Table = styled.table`
padding: 25px;

th {
  background-color: lightblue;
  padding: 10px 20px;
}

td {
  background: #D3D3D3;
}

`

//// utils 

const fetchData = async () => {
  const url = "https://randomuser.me/api/?results=20";

  try {
    const response = await fetch(url);
    const json = await response.json();
    const results = json.results;
    return results;
  } catch (error) {
    console.log("error", error);
  }
};

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

////

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
  const [sortingDirections, setSortingDirections] = useState<any>({});

  const flattenData = (data: RootObject[]) => {
    let dataArray = data.map((obj: RootObject) => {
      return flattenObject(obj.location);
    });

    const flattenedLocationHeaders = getNestedObjectKeys(data[0].location);

    const flattenedObj = {
      headers: flattenedLocationHeaders,
      data: dataArray,
    };

    setFlattenedLocations(flattenedObj);
    setData(flattenedObj);

    return flattenedObj;
  };

  const filterRows = (data: any, searchValue: any) => {
    if (searchInput !== "") {
      return data.filter((item: any) => {
        return Object.values(item)
          .join("")
          .toLowerCase()
          .includes(searchInput.toLowerCase());
      });
    } else {
      console.log('else!')
      setFlattenedLocations({ ...data });
    }
  };

  const sortData = (data: FlattenedData[], sortKey: string, sortingDirection: SortingDirection) => {
    data.sort((a: any, b: any) => {
      const relevantValueA = a[sortKey];
      const relevantValueB = b[sortKey];

      if (
        sortingDirection === SortingDirection.UNSORTED ||
        sortingDirection === SortingDirection.ASCENDING
      ) {
        if (relevantValueA < relevantValueB) return -1;
        if (relevantValueA > relevantValueB) return 1;
        return 0;
      } else {
        if (relevantValueA > relevantValueB) return -1;
        if (relevantValueA < relevantValueB) return 1;
        return 0;
      }
    });
  };

  const getNextSortingDirection = (sortingDirection: SortingDirection) => {
    if (
      sortingDirection === SortingDirection.UNSORTED ||
      sortingDirection === SortingDirection.ASCENDING
    ) {
      return SortingDirection.DESCENDING;
    }
    return SortingDirection.ASCENDING;
  };

  const sortByHeader = (headerName: string) => {
    const currentSortingDirection = sortingDirections[headerName];
    const newFlattenedLocations = {
      ...flattenedLocations,
      data: [...flattenedLocations.data],
    };

    sortData(newFlattenedLocations.data, headerName, currentSortingDirection);
    const nextSortingDirection = getNextSortingDirection(
      currentSortingDirection
    );

    const newSortingDirections = { ...sortingDirections };
    newSortingDirections[headerName] = nextSortingDirection;

    setFlattenedLocations(newFlattenedLocations);
    setSortingDirections(newSortingDirections);
  };

  useEffect(() => {
    fetchData()
      .then((response: any) => flattenData(response))
      .then((flattenedObj) => {
        const sortingDirectionHeaders: { [key: string]: string } = {};

        const flattenedHeaders = flattenedObj.headers;
        for (const header of flattenedHeaders) {
          sortingDirectionHeaders[header] = SortingDirection.UNSORTED;
        }

        setSortingDirections(sortingDirectionHeaders);
      });
  }, []);

  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <Table>
        <thead>
          {flattenedLocations.headers.map((header: string, index: number) => {
            return (
              <th key={index} onClick={() => sortByHeader(header)}>
                {header}
              </th>
            );
          })}
        </thead>
        <tbody>
          {searchInput.length > 1
            ?  filterRows(flattenedLocations.data, searchInput).map(
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
            : flattenedLocations.data.map(
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
              )}
        </tbody>
      </Table>
    </div>
  );
};

export default ApiTable;
