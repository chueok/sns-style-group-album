import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';

import { TypeormUser } from './typeorm-user.entity';
import { join, basename } from 'path';
import { DummyDatabaseHandler } from '@test-utils/persistence/dummy-database-handler';
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from '../../../../../di/infrastructure.module';

const parameters = {
  testDbPath: join('db', `${basename(__filename)}.sqlite`),
  dummyDbPath: join('db', 'dummy.sqlite'),
};

describe('TypeormUser', () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormUser>;
  let testDatabaseHandler: DummyDatabaseHandler;

  beforeAll(async () => {
    const testDataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: false,
      dropSchema: false,
    });
    await testDataSource.initialize();

    module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    })
      .overrideProvider(DataSource)
      .useValue(testDataSource)
      .compile();

    dataSource = module.get<DataSource>(DataSource);
    repository = dataSource.getRepository(TypeormUser);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe('save', () => {
    it('should save normally', async () => {
      const user = testDatabaseHandler.makeDummyUser();
      await repository.save(user);

      const foundUser = await repository.findOneBy({ id: user.id });
      await expectEqualUser(foundUser!, user);
    });
  });

  describe('delete', () => {
    // delete 허용하지 않음
  });
});

async function expectEqualUser(lhs: TypeormUser, rhs: TypeormUser) {
  expect(lhs.id).toEqual(rhs.id);
  expect(lhs.username).toEqual(rhs.username);
  expect(lhs.hasProfileImage).toEqual(rhs.hasProfileImage);
  expect(await lhs.groups).toStrictEqual(await rhs.groups);

  expect(lhs.createdDateTime).toEqual(rhs.createdDateTime);
  expect(lhs.updatedDateTime).toEqual(rhs.updatedDateTime);
  expect(lhs.deletedDateTime).toEqual(rhs.deletedDateTime);
}
