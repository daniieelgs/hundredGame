<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlayerController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::group(['prefix' => 'player'], function () {

    Route::get('read/{id}', [PlayerController::class, 'readPlayer'])->where(['id' => '[0-9]+']);
    Route::get('readAllNames', [PlayerController::class, 'readAllNamesPlayers']);
    Route::get('readAll', [PlayerController::class, 'readAllPlayers']);
    Route::get('readAllOrder', [PlayerController::class, 'readAllOrderPlayers']);
    Route::get('exists/{username}', [PlayerController::class, 'playerWithNameExists']);
    Route::get('top', [PlayerController::class, 'topPlayer']);
    Route::get('top/{top}', [PlayerController::class, 'topPlayer'])->where(['top' => '[0-9]+']);
    Route::get('last', [PlayerController::class, 'lastPlayer']);
    Route::get('last/{last}', [PlayerController::class, 'lastPlayer'])->where(['last' => '[0-9]+']);
    Route::get('range/{begin}/{end}', [PlayerController::class, 'rangePlayer'])->where(['begin' => '[0-9]+', 'end' => '[0-9]+']);
    Route::get('id/{username}', [PlayerController::class, 'idUsername']);
    Route::get('connection', [PlayerController::class, 'connectionTest']);

    Route::post('create', [PlayerController::class, 'createPlayer']);
    Route::post('connection', [PlayerController::class, 'connectionTest']);
    
    Route::put('hardUpdate/{id}', [PlayerController::class, 'hardUpdatePlayer'])->where(['id' => '[0-9]+']);
    Route::put('update/{id}', [PlayerController::class, 'updatePlayer'])->where(['id' => '[0-9]+']);

    Route::patch('hardUpdateOnly/{id}', [PlayerController::class, 'hardPatchPlayer'])->where(['id' => '[0-9]+']);
    Route::patch('updateOnly/{id}', [PlayerController::class, 'patchPlayer'])->where(['id' => '[0-9]+']);

    Route::delete('delete/{id}', [PlayerController::class, 'deletePlayer'])->where(['id' => '[0-9]+']);

    Route::get("{id}", [PlayerController::class, 'readPlayer'])->where(['id' => '[0-9]+']);
    Route::post("/", [PlayerController::class, 'createPlayer']);
    Route::put("{id}", [PlayerController::class, 'updatePlayer'])->where(['id' => '[0-9]+']);
    Route::patch("{id}", [PlayerController::class, 'patchPlayer'])->where(['id' => '[0-9]+']);
    Route::delete("{id}", [PlayerController::class, 'deletePlayer'])->where(['id' => '[0-9]+']);

});