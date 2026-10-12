// two sum 

arr = [2, 7 , 5, 4]
target = 9

function twoSum(){
    const results = [];
    for(let i=0; i<=arr.length; i++){
        for(let j=i+1; j<=arr.length; j++){
            if(arr[i]+arr[j] === target){
                results.push([arr[i], arr[j]]);
            }
        }
    }
    return results;

}

console.log(twoSum())



