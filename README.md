# ocds-helper v2

This plugin allows access to the properties of an OCDS file (json). It can read: 
* releases, 
* records, 
* release packages, 
* and record packages. 

In the case of a release package, it accesses the first one in the array. For the record packages, it can only read the first compiledRelease (for now).

In addition to allowing access to the properties of an ocds, it also allows filtering them. It also generate a series of properties that indicate: 
* the status of the contracting process (planning, tender, award, contract, implementation);
* the days that have elapsed from the publication date
* some red flags (if it has a supplier, if it has items, the budget difference between the award and the contract, the number of days to apply to the tender, if it is a competitive process)

It also has a method to access the amounts at each stage of the process.

## How to use it
import the plugin:

```
const readOCDS = require("ocds_helper");
```

pass the json to the plugin so that it returns an object of type _ocds_helper_

```
const helper = readOCDS(someOCDS)
```

to access the full release, it is through the "data" property

```
console.log(helper.data);
```

_expected output:_

```
{planning..., tender..., awards..., ...}
```

to get any value inside the standard file, write a string with the property tree separated by a dot. if the property is inside an array, the helper returns te value for each element of the array (like the description in _awards_) or the value if it's from a single node. If the function don't find any value, it returns _null_

__example 1: get a property within a collection of objects__

```
helper.getData("awards.description")
```

_expected output:_

```
["description 1", "description 2"]
```

__example 2: get a nested property outside of an array__

```
helper.getData("planning.budget.amount")
```

_expected output:_

```
{amount: 123, currency : "MXN"}
```

__example 3: get a property that is not defined__

```
helper.getData("planning.budget.amount.bananas")
```

_expected output:_

```
null
```

## get the amounts
To obtain the amount of a contracting process in its current state (contract, award, etc ...), the "amount" property can be consulted. 

This will return an object with the source of the amount, and an array of amounts, where each element represents a currency. If all the elements to be added are in the same currency, this array will only contain one element.

__example__

```
console.log(helper.amount);
```

_expected output:_

```
{
  "source": "contract",
  "data": [
    {
      "currency": "COP",
      "amount": 12326533
    }
  ]
}
```

If you want the amount of another stage, you have to use the "getStateAmount" method, and pass the name of the state from which you want to obtain the information. The possible states are inside helper.constants.states and are as follows:

* PLANNING
* TENDER
* AWARD
* CONTRACT
* IMPLEMENTATION

__example__

```
helper.getStateAmount(helper.constants.states.PLANNING)
```

_expected output:_

```
{
  "source": "planning",
  "data": [
    {
      "currency": "COP",
      "amount": 12326533
    }
  ]
}
```

## precalculated properties
__type:__ the ocsd file type

```
helper.type
```

_expected output:_

```
"release"
```



__daysDiff:__ the days that have passed since the publication of the ocds

```
helper.daysDiff
```

_expected output:_

```
1046
```

__state:__ the state of the contracting process

```
helper.type
```

_expected output:_

```
"contract"
```

## red flags
To calculate the red flags, you need to call the methods inside "indices".

__hasSupplier:__ if it has a supplier 

```
helper.indices.hasSupplier()
```

_expected output:_

```
true
```

__hasItems:__ if it has items 

```
helper.indices.hasItems()
```

_expected output:_

```
false
```

__awardContractDiff:__ the budget difference between the award and the contract 

```
helper.indices.awardContractDiff()
```

_expected output:_

```
0
```

__tenderPeriodDays:__ the number of days to apply to the tender 

```
helper.indices.awardContractDiff()
```

_expected output:_

```
0
```

__isCompetitive:__ if it is a competitive process

```
helper.indices.isCompetitive()
```

_expected output:_

```
true
```

## filter the properties
It is possible to filter the elements of an array if they meet a condition. If the elements of the array are also arrays, you must pass an object with the following properties: 

```
{
  type : 'contains',
  field : 'the-name-of-the-property-to-validate',
  value : 'the-value-to-find-inside-the-field'
}
```

__example: get the suppliers inside the parties array.__

First, it must target the "parties" array, and then, search every party inside the roles array for the value "supplier"

```
helper.getData("parties", {type : "contains", field : "roles", value : "supplier"}) 
```

_expected output:_

```
[
  {
    "name": "El Mundo es Tuyo, S.A. de C.V.",
    "id": "MX-RFC-MET8908305M9",
    "identifier": {
      "scheme": "MX-RFC",
      "id": "MET8908305M9",
      "legalName": "El Mundo es Tuyo, S.A. de C.V.",
      "juridicalPersonhood": "legalPerson"
    },
    "address": {
      "streetAddress": "Diagonal San Antonio 1216",
      "locality": "Benito Juarez",
      "region": "Ciudad de México",
      "postalCode": "03020",
      "countryName": "México"
    },
    "contactPoint": {
      "name": "Marco Antonio Cárdenas López",
      "email": "direcciongeneral@elmundoestuyo.com.mx",
      "telephone": "56396464",
      "faxNumber": "56398192",
      "url": "http://www.elmundoestuyo.com.mx/",
      "givenName": "Marco Antonio Cárdenas López"
    },
    "roles": [
      "supplier",
      "tenderer",
      "payee",
      "invitedSupplier"
    ]
  }
]
```


