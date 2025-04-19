import { Server } from '../src/presentation/Server';
import { envs } from '../src/config/envs';
import { AppRoutes } from '../src/presentation/routes';

export const testserver = new Server({
    port: envs.PORT,
    public_path: envs.PUBLIC_PATH,
    routes: AppRoutes.routes
})