async function main(){

    let a = await fetch("http://127.0.0.1:8080")  ; 
    let response = await a.text() ; 
    console.log(response) ; 
}
main()