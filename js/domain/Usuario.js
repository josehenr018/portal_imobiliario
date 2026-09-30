export class Usuario {
  constructor({id,nome,email,cpf='',telefone='',ativo=true}) {
    if (new.target === Usuario) throw new Error('Usuario é uma classe abstrata.');
    Object.assign(this,{id,nome,email,cpf,telefone,ativo});
  }
  atualizarContato({nome,telefone}) { if(nome?.trim()) this.nome=nome.trim(); if(telefone!==undefined)this.telefone=telefone.trim(); }
  inativarConta(){this.ativo=false;}
}
export class Cliente extends Usuario {
  constructor(dados){super(dados);this.rendaMensal=Number(dados.rendaMensal||0);this.idade=Number(dados.idade||0);this.poupanca=Number(dados.poupanca||0);this.fgts=Number(dados.fgts||0);this.favoritos=dados.favoritos||[];this.simulacoes=dados.simulacoes||[];}
  validarIdade(){return Number.isInteger(this.idade)&&this.idade>=18&&this.idade<=70;}
  obterParcelaMaxima(){return this.rendaMensal*.30;}
  getValorEntradaTotal(){return this.poupanca+this.fgts;}
}
export class Corretor extends Usuario {
  constructor(dados){super(dados);this.creci=dados.creci||'CRECI-DEMO';this.especialidade=dados.especialidade||'Residencial';this.totalVendas=dados.totalVendas||0;this.imoveis=dados.imoveis||[];}
  validarCRECI(){return /^\d{1,8}-[A-Z]{2}$/i.test(this.creci);}
}
export class Administrador extends Usuario { constructor(dados){super(dados);this.nivelAcesso=dados.nivelAcesso||'GERENCIAL';} }
