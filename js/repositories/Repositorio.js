export class RepositorioJSON {
 constructor(chave){this.chave=chave;}
 obter(){try{return JSON.parse(localStorage.getItem(this.chave)||'[]')}catch{return []}}
 salvar(lista){localStorage.setItem(this.chave,JSON.stringify(lista));}
}
