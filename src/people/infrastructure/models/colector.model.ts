import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('colector')
export class Colector {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('text')
    firstname: string;
    @Column('text')
    lastname: string;
    @Column('text')
    email: string;
}