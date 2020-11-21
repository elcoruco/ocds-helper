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
  const helper = readOCDS.createOCDSHelper(res.data)
});
```

* once you read the file, you can access the latest release of the document with the _data_ property (also the original ocds data is available inside _ocds_ property):

```
console.log(helper.data);

// expected output
// {planning..., tender..., awards..., ...}
```


* to get any value inside the standard file, write a string with the property tree separated by a dot. if the property is inside an array, the helper returns te value for each element of the array (like the description in _awards_) or the value if it's from a single node. If the function don't find any value, it returns _null_

```
helper.getData("awards.description")
// expected output:
// ["description 1", "description 2"]

helper.getData("planning.budget.amount")
// expected output:
// {amount: 123, currency : "MXN"}

helper.getData("planning.budget.amount.bananas")
// expected output:
// null
```