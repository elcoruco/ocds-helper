# ocds-helper
My ocds plugin helper

## How to use it
* import the plugin:

```
const readOCDS = require("ocds_helper");
```

* create an instance of the helper with one argument: the ocds release/realease package/record package. (In the example axios is used to load the json file)

```
axios.get("/ocds/secop-release_1.json").then(res => {
  const helper = readOCDS.createOCDSHelper(ocdsJson)
});
```

* once you read the file, you can access the latest release of the document with the _data_ property (also the original ocds data is available inside _ocds_ property):

```
console.log(helper.data);

// expected output
// {planning..., tender..., awards..., ...}
```


