export class Endereco {
 constructor(d={}){Object.assign(this,{logradouro:d.logradouro||'Rua das Acácias',numero:d.numero||'100',complemento:d.complemento||'',bairro:d.bairro||'Centro',cidade:d.cidade||'Birigui',estado:d.estado||'SP',cep:d.cep||'16200-000'});}
 getEnderecoCompleto(){return [this.logradouro,this.numero,this.complemento,this.bairro,this.cidade,this.estado].filter(Boolean).join(', ');}
 validarCEP(){return /^\d{5}-?\d{3}$/.test(this.cep);}
}
export class Imovel {
 constructor(d){Object.assign(this,{id:d.id,titulo:d.titulo,descricao:d.descricao||'',preco:Number(d.preco),areaTotal:Number(d.areaTotal||0),quartos:Number(d.quartos||0),banheiros:Number(d.banheiros||0),tipo:d.tipo||'Casa',status:d.status||'Disponível',corretorId:d.corretorId||1,imagens:d.imagens||[]});this.endereco=new Endereco(d.endereco);}
 isDisponivel(){return this.status==='Disponível';}
 atualizarPreco(valor){if(!(valor>0))throw new Error('O preço deve ser maior que zero.');this.preco=valor;}
 inativar(){this.status='Inativo';}
 marcarComoVendido(){if(!this.isDisponivel())throw new Error('Somente imóveis disponíveis podem ser vendidos.');this.status='Vendido';}
 getDadosCompletos(){return `${this.titulo} — ${this.endereco.getEnderecoCompleto()} — R$ ${this.preco.toLocaleString('pt-BR')}`;}
}
