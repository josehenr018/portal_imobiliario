import {RepositorioJSON} from './repositories/Repositorio.js';
import {LunarService} from './services/LunarService.js';
import {Interface} from './ui/Interface.js';
const repositorio=new RepositorioJSON('lunar-intel:imoveis:v1');
const servico=new LunarService(repositorio);
new Interface(servico).iniciar();
