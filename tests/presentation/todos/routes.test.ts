import request from 'supertest';
import { testserver } from '../../test-server';
import { prisma } from '../../../src/data/postgres';
import { TodoDatasource } from '../../../src/domain';


describe('TODO route testing', () => {


    beforeAll(async() => {
        await testserver.start()
    });

    beforeEach(async() => {
        await prisma.todo.deleteMany();
    });

    afterAll(async() => {
        testserver.close()
    })

    const todo1 = { text: 'Hola mundo 1'};
    const todo2 = { text: 'Hola mundo 2'};

    test('should return TODOs api/todos', async() => {

        await prisma.todo.createMany({
            data: [todo1, todo2]
        });

        const { body } = await request(testserver.app)
            .get('/api/todos')
            .expect(200);

        expect(body).toBeInstanceOf( Array );
        expect(body.length).toBe(2);
        expect(body[0].text).toBe(todo1.text);
        expect(body[1].text).toBe(todo2.text);
    });

    test('should return a TODO api/todos/:id', async() => {

        const todo = await prisma.todo.create({
            data: todo1
        });

        const { body } = await request(testserver.app)
        .get(`/api/todos/${todo.id}`)
        .expect(200);

        expect( body ).toEqual({
            id: todo.id,
            text: todo.text,
            completedAt: todo.completedAt,
        });
    });

    test('should return a 404 NotFound api/todos/:id', async() => {

        const todoId = 0;
        const { body } = await request(testserver.app)
        .get(`/api/todos/${todoId}`)
        .expect(404);

        expect(body).toEqual({ error: `TODO with id ${todoId} not found.` });
    });

    test('should return a new TODO api/todos', async() => {

        const { body } = await request(testserver.app)
        .post(`/api/todos`)
        .send( todo1 )
        .expect(201);

        expect( body ).toEqual({
            id: expect.any(Number),
            text: todo1.text,
            completedAt: null,
        })
    });

    test.each([
        {badTodo: {}},
        {badTodo: {text: ''}},
    ])('should return an error if text is not valid api/todos', async({ badTodo }) => {

        const { body } = await request(testserver.app)
        .post(`/api/todos`)
        .send( badTodo )
        .expect(400);

        expect( body ).toEqual({ error: 'Text property is required' })

    });

    test('should return an updated TODO api/todos/:id', async() => {

        const todo = await prisma.todo.create({data: todo1});

        const { body } = await request(testserver.app)
        .put(`/api/todos/${todo.id}`)
        .send( { text: 'Hola mundo UPDATED', completedAt: '2025-04-18'} )
        .expect(200);

        expect( body ).toEqual({
            id: expect.any(Number),
            text: 'Hola mundo UPDATED',
            completedAt: '2025-04-18T00:00:00.000Z',
        })
    });

    //TODO: relizar la operación con errores personalizados
    test('should return 404 if TODO not found api/todos/:id', async() => {

        const todoId = 999;
        const { body } = await request(testserver.app)
        .put(`/api/todos/${todoId}`)
        .send( { text: 'Hola mundo UPDATED'} )
        .expect(404);

        expect(body).toEqual({ error: `TODO with id ${todoId} not found.` });
    });

    test('should return an updated TODO only the date api/todos/:id', async() => {

        const todo = await prisma.todo.create({data: todo1});

        const { body } = await request(testserver.app)
        .put(`/api/todos/${todo.id}`)
        .send( {completedAt: '2025-04-18'} )
        .expect(200);

        expect( body ).toEqual({
            id: expect.any(Number),
            text: todo1.text,
            completedAt: '2025-04-18T00:00:00.000Z',
        })
    });

    test('should delete a TODO api/todos/:id', async() => {

        const todo = await prisma.todo.create({data: todo1});

        const { body } = await request(testserver.app)
        .delete(`/api/todos/${todo.id}`)
        .expect(200);

        expect( body ).toEqual({
            id: expect.any(Number),
            text: todo.text,
            completedAt: null,
        })
    });

    test('should return 404 if TODO do not exist api/todos/:id', async() => {

        const todoId = 999
        const { body } = await request(testserver.app)
        .delete(`/api/todos/${todoId}`)
        .expect(404);

        expect( body ).toEqual({ error: 'TODO with id 999 not found.' })
    });
})