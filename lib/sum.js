module.exports = function sum(a,b){   //다른곳에서 사용가능
  return a + b
}

//이건 다른곳에서 사용 불가. _sum을 호출못해
// funtion _sum(a,b){
//     return a+b;
// }
// module.exports = function(a,b){
//   return _sum(a,b);
// }
